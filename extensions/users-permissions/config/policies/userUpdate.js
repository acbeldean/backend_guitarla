module.exports = async (ctx, next) => {
    // If the user is an administrator we allow them to perform this action unrestricted
    if (ctx.state.user.role.name === "Administrator") {
        return next();
    }

    const { id: currentUserId } = ctx.state.user;
    // If you are using MongoDB do not parse the id to an int!
    const userToUpdate = ctx.params.id;

    if (currentUserId !== userToUpdate) {
        return ctx.unauthorized("Unauthorized.");
    }

    // Extract the fields regular users should be able to edit
    const { name, email, username, password } = ctx.request.body;
    let updateData = {}

    // Provide custom validation policy here
    if (name && name.trim() === "") {
        return ctx.badRequest("Name is required");
    }
    if (email && email.trim() === "") {
        return ctx.badRequest("Email is required");
    }
    if (username && username.trim() === "") {
        return ctx.badRequest("Username is required");
    }
    if (password) {
        if (password.trim() === "") {
            return ctx.badRequest("Password is required");
        } else {
            updateData = { ...updateData, password };
        }
    }

    // Setup the update object
    updateData = {
        ...updateData,
        name,
        email,
        username
    };


    // remove properties from the update object that are undefined (not submitted by the user in the PUT request)
    Object.keys(updateData).forEach((key) => updateData[key] === undefined && delete updateData[key]);
    if (Object.keys(updateData).length === 0) {
        return ctx.badRequest("No data submitted")
    }

    ctx.request.body = updateData;
    return next();
};