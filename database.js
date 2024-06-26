// const Database = require("@replit/database");

const db = {
  users: {},
  levels: {},
};

const database = {};
module.exports = database;

// db.get("users").then(console.log);

database.getwhole = function(fn) {
  // doesn't work
  // db.get("/").then(value => { fn(value) });
  fn(db);
};
database.getusers = function(fn) {
  //db.get("users").then(value => { fn(value) });
  fn(db.users);
};
database.setusers = function(users, fn) {
  //db.set("users", users).then(fn);
  db.users = users;
  fn(users);
};
database.getlevels = function(fn) {
  //db.get("levels").then(value => { fn(value) });
  fn(db.levels);
};
database.setlevels = function(levels) {
  db.levels = levels;
  //db.set("levels", levels).then(() => { });
  //fn(levels);
};
database.compareusers = function(newusers, fn) {
  database.getusers(function(users) {
    // set users first!
    database.setusers(newusers, function() {
      if (users == null) users = {};
      const result = [];
      for (const user_key in newusers) {
        const user = newusers[user_key];
        if (user == null) continue;
        let olduser = users[user_key];
        if (olduser == null) {
          users[user_key] = {};
          olduser = users[user_key];
          olduser.progress = {};
        }
        for (const group_key in user.progress) {
          if (group_key === "extra" || group_key === "points") continue;
          const newnumber = user.progress[group_key];
          const oldnumber = olduser.progress[group_key];
          // user solved something!
          if (newnumber > oldnumber) {
            for (let i = 0; i < newnumber - oldnumber; ++i) {
              // if (oldnumber + i === -1) continue;
              result.push({
                group: group_key,
                name: user.nickname || user.username,
                username: user.username,
                tag: user.tag,
                tagid: user.tagid,
                number: oldnumber + i,
              });
            }
          }
        }
      }
      // then run the function
      fn(result);
    });
  });
};