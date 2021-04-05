const fetch = require('node-fetch').default;

const handler = async (event, context) => {
    try {
        const user = JSON.parse(event.body).user;
        

        const usersUrl = `${context.clientContext.identity.url}/admin/users`;
        let data = await (await fetch(usersUrl, {
            method: 'GET',
            headers: { Authorization: `Bearer ${context.clientContext.identity.token}` },
        })).json();

        if (!data.users) {
            throw Error("Error while trying to source users - likely insufficient authentication");
        }

        let topUsers = [];
        let myProfile = user.user_metadata.profile; //This user must have meta data for this to be called
        for (let testU of data.users) {
            if (!testU.user_metadata || !testU.user_metadata.listing || testU.email == user.email) continue;
            let profile = testU.user_metadata.profile;

            //Absolute preferences - failure in any of these is an instant unmatch
            let absScore = 0; //The lower the better
            for (let pref in profile.prefsAbs) {
                console.log(`Checking... ${pref}: ${myProfile.prefsAbs[pref].me} vs ${profile.prefsAbs[pref].you}`);
                console.log(`Checking... ${pref}: ${myProfile.prefsAbs[pref].you} vs ${profile.prefsAbs[pref].me}`);
                absScore += 1*(myProfile.prefsAbs[pref].you < profile.prefsAbs[pref].me);
                absScore += 1*(profile.prefsAbs[pref].you < myProfile.prefsAbs[pref].me);
                if (absScore > 0) break;
            }

            if (profile.prefsRanked.lgbtqpref == "n" && myProfile.prefsRanked.lgbtqpref == "n") {                 //Both not lgbtq - need same pronouns
                absScore += Math.abs(profile.prefsRanked.pronouns - myProfile.prefsRanked.pronouns);
            } else if (profile.prefsRanked.lgbtqpref == "y" && myProfile.prefsRanked.lgbtqpref == "y") {          //Both lgbtq
                if (profile.prefsRanked.lgbtq != "1" || myprofile.prefsRanked.lgbtq != "1") {                     //one not comfortable - need same pronouns
                    absScore += Math.abs(profile.prefsRanked.pronouns - myProfile.prefsRanked.pronouns);          //need same pronouns
                }
            } else if (profile.prefsRanked.lgbtqpref != "r" || myProfile.prefsRanked.lgbtqpref != "r") {           //One lgbtq and the other not and both do not have rather not say - incompatible
                absScore += 1; //incompatible
            }

            if (absScore > 0) {
                testU.matchScore = -1; //Worst score possible - impossible match
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
            rankedScore += 10*(
                profile.prefsRanked.major == myProfile.prefsRanked.major
            );
            rankedScore += 10*(
                profile.prefsRanked.sport == myProfile.prefsRanked.sport
            );

            rankedScore += 3* //O(n^2) for n=#interests
                profile.presRanked.interests.filter(
                    interest => myProfile.presRanked.interest.includes(interest)
                ).length;

            rankedScore -= 10*( //Can be very important, so max for each rank is 5. The lower the better, so -=
                Math.abs(
                  profile.prefsRanked.ideology.rank*(profile.prefsRanked.ideology.al)
                  - myProfile.prefsRanked.ideology.rank*(myProfile.prefsRanked.ideology.al)
                )
                + Math.abs(
                  profile.prefsRanked.ideology.rank*(profile.prefsRanked.ideology.lr)
                  - myProfile.prefsRanked.ideology.rank*(myProfile.prefsRanked.ideology.lr)
              )
            );

            rankedScore += 10*(
                profile.prefsRanked.location == myProfile.prefsRanked.location
                || 0.5*(profile.prefsRanked.location == "Unsure") //Weight half in case one or the other is unsure
                || 0.5*(myProfile.prefsRanked.location == "Unsure")
            );
            rankedScore += 10*(
                profile.prefsRanked.hall == myProfile.prefsRanked.hall
                || 0.5*(profile.prefsRanked.hall == "Unsure") //Weight half in case one or the other is unsure
                || 0.5*(myProfile.prefsRanked.hall == "Unsure")
            );

            let minimizedScore = 0; //The higher the better!
            for (let pref in profile.prefsMinimized) {
                minimizedScore += 10*Math.abs(profile.prefsMinimized[pref] - myProfile.prefsMinimized[pref]);
            }

            // maxScore = 207
            let matchScore = 100*(minimizedScore + rankedScore)/207;
            testU.matchScore = matchScore;
            console.log("User", testU);
            console.log("Score", matchScore);
        }

        console.log("Users:", data.users);

        return {
            statusCode: 200,
            body: JSON.stringify({
              app_metadata: {
                  success: true,
                  users: topUsers
                }
            })
        };
    } catch (error) {
        console.log("Error", error);
        return {
          statusCode: 200,
          body: JSON.stringify({
            app_metadata: {
                success: false,
                err: error
            }
          })
        }
    }
};

module.exports = { handler }

/*

        const usersUrl = `${identity.url}/admin/users`;
        const adminAuthHeader = `Bearer ${identity.token}`;
        console.log("CTX", context.clientContext);
        let data = await (await fetch(usersUrl, {
            method: 'GET',
            headers: { Authorization: adminAuthHeader },
        })).json();
      
        console.log("Resulting data: ",data);
        if (!data.users) {
          return {
              statusCode: 401,
              body: JSON.stringify({
                success: false,
                err: "Error while trying to source users - likely insufficient authentication"
              })
          };
        }

        let topUsers = [];
        let myProfile = user.user_metadata.profile; //This user must have meta data for this to be called
        for (let testU of data.users) {
            if (!testU.user_metadata || !testU.user_metadata.listing || testU.email == user.email) continue;
            let profile = testU.user_metadata.profile;

            //Absolute preferences - failure in any of these is an instant unmatch
            let absScore = 0; //The lower the better
            for (let pref in profile.prefsAbs) {
                console.log(`Checking... ${pref}: ${myProfile.prefsAbs[pref]} vs ${profile.prefsAbs[pref]}`);
                absScore += 1*(myProfile.prefsAbs[pref].you < profile.prefsAbs[pref].me);
                absScore += 1*(profile.prefsAbs[pref].you < myProfile.prefsAbs[pref].me);
                if (absScore > 0) break;
            }

            if (profile.prefsRanked.lgbtqpref == "n" && myProfile.prefsRanked.lgbtqpref == "n") {                 //Both not lgbtq - need same pronouns
                absScore += Math.abs(profile.prefsRanked.pronouns - myProfile.prefsRanked.pronouns);
            } else if (profile.prefsRanked.lgbtqpref == "y" && myProfile.prefsRanked.lgbtqpref == "y") {          //Both lgbtq
                if (profile.prefsRanked.lgbtq != "1" || myprofile.prefsRanked.lgbtq != "1") {                     //one not comfortable - need same pronouns
                    absScore += Math.abs(profile.prefsRanked.pronouns - myProfile.prefsRanked.pronouns);          //need same pronouns
                }
            } else if (profile.prefsRanked.lgbtqpref != "r" || myProfile.prefsRanked.lgbtqpref != "r") {           //One lgbtq and the other not and both do not have rather not say - incompatible
                absScore += 1; //incompatible
            }

            if (absScore > 0) {
                testU.matchScore = -1; //Worst score possible - impossible match
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
            rankedScore += 10*(
                profile.prefsRanked.major == myProfile.prefsRanked.major
            );
            rankedScore += 10*(
                profile.prefsRanked.sport == myProfile.prefsRanked.sport
            );

            rankedScore += 3* //O(n^2) for n=#interests
                profile.presRanked.interests.filter(
                    interest => myProfile.presRanked.interest.includes(interest)
                ).length;

            rankedScore -= 10*( //Can be very important, so max for each rank is 5. The lower the better, so -=
                Math.abs(
                  profile.prefsRanked.ideology.rank*(profile.prefsRanked.ideology.al)
                  - myProfile.prefsRanked.ideology.rank*(myProfile.prefsRanked.ideology.al)
                )
                + Math.abs(
                  profile.prefsRanked.ideology.rank*(profile.prefsRanked.ideology.lr)
                  - myProfile.prefsRanked.ideology.rank*(myProfile.prefsRanked.ideology.lr)
              )
            );

            rankedScore += 10*(
                profile.prefsRanked.location == myProfile.prefsRanked.location
                || 0.5*(profile.prefsRanked.location == "Unsure") //Weight half in case one or the other is unsure
                || 0.5*(myProfile.prefsRanked.location == "Unsure")
            );
            rankedScore += 10*(
                profile.prefsRanked.hall == myProfile.prefsRanked.hall
                || 0.5*(profile.prefsRanked.hall == "Unsure") //Weight half in case one or the other is unsure
                || 0.5*(myProfile.prefsRanked.hall == "Unsure")
            );

            let minimizedScore = 0; //The higher the better!
            for (let pref in profile.prefsMinimized) {
                minimizedScore += 10*Math.abs(profile.prefsMinimized[pref] - myProfile.prefsMinimized[pref]);
            }

            // maxScore = 207
            testU.matchScore = 100*(minimizedScore + rankedScore)/207;
        }
        console.log(data.users);

            return {
                statusCode: 200,
                body: JSON.stringify({
                  success: true,
                  users: []
                })
            };
        } catch (error) {
            console.log("Err", error);
            return {
              statusCode: 501,
              body: JSON.stringify({
                success: false,
                err: error
              })
            };
        }
*/