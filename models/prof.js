const dbProf = require('../database/prof');


exports.myClasses = async function (profName) {
    return dbProf.myClasses(profName)
        .then(resolve => {
            console.log(resolve);
            return resolve;
        }, reject => {
            res.status(501).send('Database connection error : ' + reject);
        });
};

exports.getMatiereNotes = function (promo, matiere) {
    return dbProf.getMatiereNotes(promo, matiere)
        .then(resolve => {
            console.log(resolve);
            return resolve;
        }, reject => {
            res.status(501).send('Database connection error : ' + reject);
        });
};

exports.newNote = async function (note, eleve, classe, matiere, res) {


    const doesNoteExists = await dbProf.doesNoteExists(matiere, eleve)
    if (doesNoteExists === true) {
        dbProf.updateNote(note, matiere, eleve)
            .then(() => { res.redirect('/prof')})
            .catch(error => {return (error)})
    } else {
      dbProf.newNote(note, matiere, eleve)
          .then(() => { res.redirect('/prof')
          }, reject => {
              res.status(501).send('Database connection error : ' + reject);
          });
    }
};