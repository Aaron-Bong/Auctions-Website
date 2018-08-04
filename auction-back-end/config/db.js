const  mysql  =  require ( 'mysql' );

let state = {
    pool: null
};

exports.connect = function (done) {
    state.pool = mysql.createPool({
        multipleStatements : true,
        connectionLimit : 100,
        host : 'mysql3.csse.canterbury.ac.nz',
        user :  'acb116',
        password :  '55623236',
        database :  'acb116'
    });
    done();
};

exports.get_pool = function () {
    return state.pool;
};


