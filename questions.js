module.exports = {
    whatDoYouWant: {
      type: 'list',
      name: 'action',
      message: 'What do you want to do?',
      choices: [{
          name: 'Create a card',
          value: 'create',
        },
        {
          name: 'Solve cards problem.',
          value: 'display'
        }]
    },
    cardQuestion: {
      name: 'answerForCard',
      message: null,
    },
    createWhichCard: {
      type: 'list',
      name: 'createWhichCard',
      message: 'Which card do you want to create?',
      choices: [{
          name: 'Basic Card',
          value: 'basic',
        },
        {
          name: 'Cloze Card',
          value: 'cloze'
        }]
    },
    basicFront: {
      name: 'front',
      message: 'What is a "front" text of Basic card?'
    },
    basicBack: {
      name: 'back',
      message: 'What is a "back" text of Basic card?'
    },
    clozeFullText: {
      name: 'full',
      message: 'What is a "full" text of Cloze card?'
    },
    clozeCloze: {
      name: 'cloze',
      message: 'What is a "cloze" text of Cloze card?',
      validate: null
    }
  };
  