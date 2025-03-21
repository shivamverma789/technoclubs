module.exports = {
    ensureAuthenticated: (req, res, next) => {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash("error_msg", "Please log in to access this resource");
      res.redirect("/login");
    },
  
    forwardAuthenticated: (req, res, next) => {
      if (!req.isAuthenticated()) {
        return next();
      }
      res.redirect("/dashboard");
    },
  
    ensureRole: (role) => {
      return (req, res, next) => {
        if (req.isAuthenticated() && req.user.role === role) {
          return next();
        }
        req.flash("error_msg", "Unauthorized access");
        res.redirect("/dashboard"); // Redirect unauthorized users
      };
    },
  
    ensureRoles: (roles) => {
      return (req, res, next) => {
        if (req.isAuthenticated() && roles.includes(req.user.role)) {
          return next();
        }
        req.flash("error_msg", "Unauthorized access");
        res.redirect("/dashboard"); // Redirect unauthorized users
      };
    },
  };
  