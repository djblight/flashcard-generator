const Rx = require('Rx');
const inquirer = require('inquirer');
const BasicCard = require('./basic-card');
const ClozeCard = require('./cloze-card');
const question = require('./questions');
const helper = require('./constructor');

// question path
const questions$ = new Rx.BehaviorSubject(question.whatDoYouWant);

// user answer path
const answers$ = inquirer.prompt(questions$).ui.process;

const basicFrontText$ = new Rx.Subject();
const basicBackText$ = new Rx.Subject();
const clozeFullText$ = new Rx.Subject();
const clozeClozeText$ = new Rx.Subject();
const selectedCard$ = new Rx.Subject();
const answerForCardProblem$ = new Rx.Subject();
const displayCards$ = new Rx.Subject();

const createBasicCards$ = Rx.Observable
  .zip(basicFrontText$, basicBackText$)
  .map(([front, back]) => new BasicCard(front, back))
  .do(() => console.log(' - Basic Card was created!\n'));
  
const createClozeCards$ = Rx.Observable
  .zip(clozeFullText$, clozeClozeText$)
  .map(([full, cloze]) => new ClozeCard(full, cloze))
  .do(() => console.log(' - Cloze Card was created!\n'));

const createdCards$ = Rx.Observable.merge(createBasicCards$, createClozeCards$)
  .scan((createdCards, card) => [...createdCards, card], [])
  .share();

const initialCards$ = Rx.Observable.of([
    new BasicCard('Who was the first president of the United States?', 'George Washington'),
    new ClozeCard('Dont mess with Texas.', 'Texas')
  ]);

const totalCards$ = initialCards$
  .combineLatest(createdCards$.startWith([]))
  .map(([initialCards, createdCards]) => [...initialCards, ...createdCards]);

const showCardList$ = displayCards$.withLatestFrom(totalCards$)
  .map(([_, cards]) => {
    return cards.map(card => {
      if(card instanceof BasicCard) return helper.convertToBasicCardChoices(card);
      else return helper.convertToClozeCardChoices(card);
    })
  })
  .map(helper.makeCardChoiceQuestion);
  
const checkAnswer$ = Rx.Observable
  .zip(selectedCard$ ,answerForCardProblem$)
  .map(([card, answer]) => {
    if (card instanceof BasicCard) return card.back.toLowerCase() === answer.toLowerCase();
    else return card.cloze.toLowerCase() === answer.toLowerCase();
  });

answers$.subscribe(ans => {
  console.log('\n');
  switch (ans.name) {
    case 'action': {
      if (ans.answer === 'create') return questions$.onNext(question.createWhichCard);

      else {
          return displayCards$.onNext('Great!');
      }

    };

    case 'selectCard': {
      const card = ans.answer;
      selectedCard$.onNext(card);
      if(card instanceof BasicCard) {
        return questions$.onNext(Object.assign(question.cardQuestion, {message: card.front}));
      } else {
        return questions$.onNext(Object.assign(question.cardQuestion, {message: card.partial}));
      }
    };

    case 'answerForCard': {
      return answerForCardProblem$.onNext(ans.answer);
    }

    case 'createWhichCard': {
      if (ans.answer === 'basic') {
        return questions$.onNext(question.basicFront);
      }
      else {
        return questions$.onNext(question.clozeFullText);
      }
    }

    case 'front': {
      basicFrontText$.onNext(ans.answer);
      return questions$.onNext(question.basicBack);
    }

    case 'back': {
      return basicBackText$.onNext(ans.answer);
    }

    case 'full': {
      const fullText = ans.answer;
      clozeFullText$.onNext(fullText);
      return questions$.onNext(
        Object.assign(question.clozeCloze, {
          validate: input => input && fullText.indexOf(input) > -1 ? true : "Invalid input!"
        })
      );
    }

    case 'cloze': {
      return clozeClozeText$.onNext(ans.answer);
    }

    default:
      return;
  }
});

createdCards$.subscribe(cards => {
  if(!cards.length) return;
  questions$.onNext(question.whatDoYouWant);
});

showCardList$.subscribe(q => {
  questions$.onNext(q);
});

checkAnswer$.subscribe(isCorrect => {
    if(isCorrect) console.log(' - Correct!\n');
    else console.log(' - wrong!\n');
    questions$.onNext(question.whatDoYouWant);
});
