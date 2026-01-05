const username = "USER_NAME_HERE";

let followers = [];
let followings = [];

(async () => {
  try {
    console.log(`Started...`);

    // Get user ID from the profile page
    const profileRes = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
      headers: {
        'x-ig-app-id': '936619743392459'
      }
    });

    const profileJson = await profileRes.json();
    const userId = profileJson.data.user.id;

    console.log(`Found user ID: ${userId}`);

    // Fetch followers
    let after = null;
    let has_next = true;

    console.log('Fetching followers...');
    while (has_next) {
      const followerRes = await fetch(
        `https://www.instagram.com/api/v1/friendships/${userId}/followers/?count=50` +
        (after ? `&max_id=${after}` : ''),
        {
          headers: {
            'x-ig-app-id': '936619743392459'
          }
        }
      );
      
      const followerJson = await followerRes.json();
      
      has_next = followerJson.next_max_id != null;
      after = followerJson.next_max_id;
      
      followers = followers.concat(
        followerJson.users.map((user) => ({
          username: user.username,
          full_name: user.full_name,
        }))
      );
      
      console.log(`Fetched ${followers.length} followers so far...`);
    }

    console.log(`Total followers: ${followers.length}`);

    // Fetch following
    after = null;
    has_next = true;

    console.log('Fetching following...');
    while (has_next) {
      const followingRes = await fetch(
        `https://www.instagram.com/api/v1/friendships/${userId}/following/?count=50` +
        (after ? `&max_id=${after}` : ''),
        {
          headers: {
            'x-ig-app-id': '936619743392459'
          }
        }
      );
      
      const followingJson = await followingRes.json();
      
      has_next = followingJson.next_max_id != null;
      after = followingJson.next_max_id;
      
      followings = followings.concat(
        followingJson.users.map((user) => ({
          username: user.username,
          full_name: user.full_name,
        }))
      );
      
      console.log(`Fetched ${followings.length} following so far...`);
    }

    console.log(`Total following: ${followings.length}`);

    // Do the comparison
    const followerUsernames = new Set(followers.map(f => f.username));
    const followingUsernames = new Set(followings.map(f => f.username));
    
    const dontFollowBack = followings.filter(f => !followerUsernames.has(f.username));
    const iDontFollowBack = followers.filter(f => !followingUsernames.has(f.username));
    
    console.log(`\n=== RESULTS ===`);
    console.log(`You follow ${followings.length} people`);
    console.log(`You have ${followers.length} followers`);
    console.log(`\nPeople you follow who don't follow you back: ${dontFollowBack.length}`);
    dontFollowBack.forEach(user => console.log(`  - ${user.username} (${user.full_name})`));
    
    console.log(`\nPeople who follow you that you don't follow back: ${iDontFollowBack.length}`);
    
  } catch (err) {
    console.log('Error:', err);
    console.log('Make sure you are logged into Instagram and on the instagram.com domain.');
  }
})();