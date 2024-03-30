

const find_user = function(users, userid) {
  for (const u in users) {
    if (users[u].tagid === userid) return users[u];
  }
  return undefined;
}

const nothing = function() { }

// user: discord user object
// users: firebase data from ref "/users"
const update_roles = function(guild, userid, users) {
  const roles = guild.roles;
  const members = guild.members;

  guild.members.fetch(userid).then(member => {
    const u = find_user(users, userid);
    if (!u || !member) {
      console.log("Not found: ", member);
      return;
    } else {
      const nickname = member.nickname || member.user.username;
      //console.log("Updating roles for member '" + nickname + "'");

      for (const group_key in u.progress) {
        const number = u.progress[group_key];
        if (number < 0) continue;
        if (group_key === "extra") {
          const str = number;
          for (const c of str) {
            // to do
          }
        } else {
          const role_name = "reached-" + group_key + "-" + number;
          const existing_role = member.roles.cache.find(r => r.name.includes("reached-" + group_key));
          const role_to_add = roles.cache.find(r => r.name === role_name);
          if (existing_role) {
            if (existing_role.name === role_name) continue;
            member.roles.remove(existing_role).then(member2 => {
              if (role_to_add) member2.roles.add(role_to_add);
            });
          } else {
            if (role_to_add) member.roles.add(role_to_add);
          }
        }
      }

      // nickname
      const max_points = users.example.points;
      const nickname_splitted = nickname.split(/[\[\]]/);
      const old_points = (nickname_splitted.length > 1) ? +nickname_splitted[1] : -2000;
      let points = u.points;
      if (u.points >= max_points) points = "🧩";
      else if (u.points < old_points) points = old_points;
      member.setNickname((u.nickname || member.user.username || u.username) + " [" + points + "]").catch(nothing);
      console.log("Updated roles for member '" + nickname + "' -> '" + (u.nickname || member.user.username || u.username) + " [" + points + "]" + "'");
    }
  }).catch(nothing);
}

module.exports = {
  update_roles: update_roles
}
