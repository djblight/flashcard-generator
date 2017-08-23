
module.exports = function ClozeCard(text, cloze) {
    if (this instanceof ClozeCard) {
      this.fullText = text;
      this.partial = text.replace(cloze, '...');
      
      if(this.partial === text) throw new Error('This doesnt work, oops');
      this.cloze = cloze;
  
    } else return new ClozeCard(text, cloze);

  };