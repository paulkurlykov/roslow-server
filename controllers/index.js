const userControllers = require('./user-controllers');
const postControllers = require('./post-controllers');
const commentControllers = require('./comment-controllers');
const likeControllers = require('./like-controller');
const followControllers = require('./follow-controller');

class UserControllers {

    static login = userControllers.login;
    static logout = userControllers.logout;
    static registration = userControllers.registration;
    static activation = userControllers.activation;
    static refresh = userControllers.refresh;
    static currentUser = userControllers.currentUser;
    static updateUser = userControllers.updateUser;
    static getUsers = userControllers.getUsers;
    static getUserById = userControllers.getUserById;
}

class PostControllers {
    static createPost = postControllers.createPost;
    static getPosts = postControllers.getPosts;
    static getPostById = postControllers.getPostById;
    static deletePost = postControllers.deletePost;

}
class CommentControllers {
    static createComment = commentControllers.createComment;
    static deleteComment =commentControllers.deleteComment;

}

class LikeControllers {
    static likePost = likeControllers.likePost; 
    static unlikePost = likeControllers.unlikePost;
}

class FollowControllers {
    static followUser = followControllers.followUser;
    static unfollowUser = followControllers.unfollowUser;
}


module.exports = {
    UserControllers, 
    PostControllers, 
    CommentControllers,
    LikeControllers,
    FollowControllers
};