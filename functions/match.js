const fetch = require('node-fetch').default;

const handler = async (event, context) => {
    try {
        console.log(event, context);
        const user = JSON.parse(event.body);

        if (!context.clientContext.identity) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    err: "Invalid authentication"
                })
            }
        }

        const usersUrl = `${context.clientContext.identity.url}/admin/users`;
        let data = await (await fetch(usersUrl, {
            method: 'GET',
            headers: { Authorization: `Bearer ${context.clientContext.identity.token}` },
        })).json();

        if (!data.users) {
            throw Error("Error while trying to source users - likely insufficient authentication");
        }

        let rankedUsers = {}; //Store ranked users by score as key and value as array of user listings
        let myProfile = user.user_metadata.profile; //This user must have meta data for this to be called
        for (let testU of data.users) {
            if (!testU.user_metadata || !testU.user_metadata.listing || testU.email == user.email) continue;
            let profile = testU.user_metadata.profile;

            //Absolute preferences - failure in any of these is an instant unmatch
            let absScore = 0; //The lower the better
            //console.log("Checking abs prefs...");
            for (let pref in profile.prefsAbs) {
                //console.log(`Checking... this user ${pref}: would I ${myProfile.prefsAbs[pref].me} and do I mind ${myProfile.prefsAbs[pref].you}`);
                //console.log(`Checking... test user ${pref}: would I ${profile.prefsAbs[pref].me} and do I mind ${profile.prefsAbs[pref].you}`);
                //console.log(`OK for me ${myProfile.prefsAbs[pref].you >= profile.prefsAbs[pref].me}\nOK for you ${myProfile.prefsAbs[pref].me <= profile.prefsAbs[pref].you}`)
                absScore += 1*(myProfile.prefsAbs[pref].you < profile.prefsAbs[pref].me);
                absScore += 1*(myProfile.prefsAbs[pref].me > profile.prefsAbs[pref].you);
                if (absScore > 0) break;
            }

            //console.log("Abs Score:", absScore);
            if (absScore > 0) {
                continue;
            }
            
            //console.log(`Gender and sexuality:\nMe: Pronouns: ${myProfile.prefsRanked.pronouns} LGBTQ: ${myProfile.prefsRanked.lgbtq} LGBTQ Pref: ${myProfile.prefsRanked.lgbtqpref}\You: Pronouns: ${profile.prefsRanked.pronouns} LGBTQ: ${profile.prefsRanked.lgbtq} LGBTQ Pref: ${profile.prefsRanked.lgbtqpref}`);
            if ((profile.prefsRanked.lgbtq == "n" && myProfile.prefsRanked.lgbtq == "n") && (!profile.prefsRanked.genderinclusive || (profile.prefsRanked.genderinclusive == "n" || myProfile.prefsRanked.genderinclusive == "n"))) {                 //Both not lgbtq - need same pronouns
                absScore += Math.abs(profile.prefsRanked.pronouns - myProfile.prefsRanked.pronouns);
                //console.log(`Both straight. Gender 1: ${profile.prefsRanked.pronouns} Gender 2: ${profile.prefsRanked.pronouns} Score: ${absScore}`);
            } else if (profile.prefsRanked.lgbtq == "y" && myProfile.prefsRanked.lgbtq == "y") {          //Both lgbtq
                if (profile.prefsRanked.lgbtqpref != "1" || myProfile.prefsRanked.lgbtqpref != "1") {                     //one not comfortable - need same pronouns
                    absScore += Math.abs(profile.prefsRanked.pronouns - myProfile.prefsRanked.pronouns);          //need same pronouns
                }
                //console.log(`Both not straight. Gender 1: ${profile.prefsRanked.pronouns} Gender 2: ${profile.prefsRanked.pronouns} Score: ${absScore}`);
            } else if (profile.prefsRanked.lgbtq != "r" || myProfile.prefsRanked.lgbtq != "r") {           //One lgbtq and the other not and both do not have rather not say - incompatible
                absScore += 1; //incompatible
                //console.log(`Both neither straight nor not straight and want to be dormed together. Gender 1: ${profile.prefsRanked.pronouns} Gender 2: ${profile.prefsRanked.pronouns} Score: ${absScore}`);
            }

            if (absScore > 0) {
                continue;
            }


            //Ranked Preferences - need comparision
            let rankedScore = 0; //The higher the better
            rankedScore += 10*(
                profile.prefsRanked.state == myProfile.prefsRanked.state
                || ( //only match country if not US
                      profile.prefsRanked.country == myProfile.prefsRanked.country
                      &&  profile.prefsRanked.country != "United States"
                )
            );
            //console.log(`Ranked after country/state: this ${myProfile.prefsRanked.country} you ${profile.prefsRanked.country}: ${rankedScore}`);
            rankedScore += 10*(
                profile.prefsRanked.major == myProfile.prefsRanked.major
            );
            //console.log(`Ranked after major: this ${myProfile.prefsRanked.major} you ${profile.prefsRanked.major}: ${rankedScore}`);
            rankedScore += 10*(
                profile.prefsRanked.sport == myProfile.prefsRanked.sport
            );
            //console.log(`Ranked after sport: this ${myProfile.prefsRanked.sport} you ${profile.prefsRanked.sport}: ${rankedScore}`);
            rankedScore += 3* //O(n^2) for n=#interests
                profile.prefsRanked.interests.filter(
                    interest => myProfile.prefsRanked.interests.includes(interest)
                ).length;
            //console.log(`Ranked after interest: this ${myProfile.prefsRanked.interests} you ${profile.prefsRanked.interests}: ${rankedScore}`);
            let politicalScore = 0;
            if (profile.prefsRanked.ideology.rank != 0 && myProfile.prefsRanked.ideology.rank != 0) { //only if both care
                politicalScore = ( //Can be very important, so max for each rank is 5. The lower the better, so -=
                    Math.abs(
                      profile.prefsRanked.ideology.rank*(profile.prefsRanked.ideology.al)
                      - myProfile.prefsRanked.ideology.rank*(myProfile.prefsRanked.ideology.al)
                    )
                    + Math.abs(
                      profile.prefsRanked.ideology.rank*(profile.prefsRanked.ideology.lr)
                      - myProfile.prefsRanked.ideology.rank*(myProfile.prefsRanked.ideology.lr)
                    )
                );
            }
            rankedScore -= 10*politicalScore;
            //console.log(`Ranked after ideology: this ${JSON.stringify(myProfile.prefsRanked.ideology)} you ${JSON.stringify(profile.prefsRanked.ideology)}: ${rankedScore}`);
            rankedScore += 10*(
                profile.prefsRanked.location == myProfile.prefsRanked.location
                || 0.5*(profile.prefsRanked.location == "Unsure") //Weight half in case one or the other is unsure
                || 0.5*(myProfile.prefsRanked.location == "Unsure")
            );
            //console.log(`Ranked after major: this ${myProfile.prefsRanked.location} you ${profile.prefsRanked.location}: ${rankedScore}`);
            rankedScore += 10*(
                profile.prefsRanked.hall == myProfile.prefsRanked.hall
                || 0.5*(profile.prefsRanked.hall == "Unsure") //Weight half in case one or the other is unsure
                || 0.5*(myProfile.prefsRanked.hall == "Unsure")
            );
            //console.log(`Ranked after major: this ${myProfile.prefsRanked.hall} you ${profile.prefsRanked.hall}: ${rankedScore}`);
            let minimizedScore = 0; //The higher the better!
            for (let pref in profile.prefsMinimized) {
                minimizedScore += 10*Math.abs(profile.prefsMinimized[pref] - myProfile.prefsMinimized[pref]);
            }

            // maxScore = 207
            let matchScore = Math.max(0, Math.round(100*(minimizedScore + rankedScore)/207)); //Scale score and make sure never below 0
            if (!rankedUsers[matchScore]) {
                rankedUsers[matchScore] = [];
            }
            if (testU.user_metadata.listing.public == "y") {
                rankedUsers[matchScore].push(testU.user_metadata);
            } else {
                rankedUsers[matchScore].push({
                    listing: testU.user_metadata.listing
                });
            }
        }

        let topUsers = [];
        //Keys in rankedUsers will be auto-sorted as all ints - all we need to do is find (up to) the top 25
        let keys = (Object.keys(rankedUsers));
        keys = keys.slice(0, Math.min(25, keys.length)).sort().reverse();
        let i = 0;
        while (topUsers.length < 25 && i < keys.length) { //add users, up to 25
            for (let u of rankedUsers[keys[i]]) {
                u.listing.score = keys[i];
                topUsers.push(u);
            }
            i++;
        }

        console.log("Returning data: ", topUsers);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                users: topUsers
            })
        };
    } catch (error) {
        console.log("Error", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                err: error
            })
        };
    }
};

module.exports = { handler }