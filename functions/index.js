const functions = require('firebase-functions');

const FireSql = require('firesql');

// The Firebase Admin SDK to access Cloud Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

exports.rate = functions.https.onRequest(async (req, res) => {
    const thingRef = admin.firestore().doc('things/' + req.body.thingId);
    const rating = req.body.take ? 5 : 0;

    // Add the rating record
    const writeResult = await admin.firestore().collection('ratings').add({ thingId: thingRef, rating: rating });
    
    // Update the thing record with the new rating
    const doc = await (admin.firestore().collection('things').doc(req.body.thingId).get())
    const thing = doc.data();
    
    var newNumRatings = thing.numRatings + 1;
    var newRating = (((thing.rating * thing.numRatings) + rating) / newNumRatings);

    await admin.firestore().collection('things').doc(req.body.thingId).set({
        rating: newRating,
        numRatings: newNumRatings
    }, { merge: true });
    
    // Send back a message that we've succesfully written the message
    res.json({result: `Rating ${writeResult.id} added.`});
});

exports.things = functions.https.onRequest(async (req, res) => {
    
    var things = [];

    // Update the thing record with the new rating
    var querySnapshot = await (admin.firestore().collection('things').get());

    console.log(querySnapshot);

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(data);
        things.push({
            id: doc.id,
            name: data.name,
            rating: data.rating
        });
    });

    // Send back a message that we've succesfully written the message
    res.json({results: things });
});

exports.search = functions.https.onRequest(async (req, res) => {
    
    var things = [];
    var filter = req.query.filter;

    console.log("Filter: ", filter);
    
    const fireSQL = new FireSql.FireSQL(admin.firestore());

    var queryResults = await fireSQL.query(`SELECT * FROM things WHERE name like '${filter}%'`);

    console.log(queryResults);

    queryResults.forEach((doc) => {
        const data = doc;
        console.log(data);
        things.push({
            id: doc.id,
            name: data.name,
            rating: data.rating
        });
    });

    // Send back a message that we've succesfully written the message
    res.json({results: things });
});

