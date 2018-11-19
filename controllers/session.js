const session = [];

exports.newSession = function (user, profile) {

    const id = Math.floor(Math.random() * 1000000);
    session.push({id, user, profile});
    return id;
};

exports.controlSession = function (cookie) {

    for (var i in session) {

        if(cookie == session[i].id){
            switch (session[i].profile) {
                case 'admin':
                    return 1;
                case 'prof':
                    return 2;
                case 'eleve':
                    return 3;
            }
        }
    }

    return 0;
};

exports.getUser = function (cookie) {

    for (var i in session) {
        if (cookie == session[i].id) {
            return session[i].user;
        }
    }

};

exports.logout = function (cookie) {

    for (let i in session) {
        if (cookie == session[i].id) {
            delete session[i]
 //           session.splice(i, 1);
        }
    }
};