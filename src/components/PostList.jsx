import { Fragment } from "react";
import PropTypes from "prop-types";
import { Post } from "./Post.jsx";
import "./PostList.css";

export function PostList({ posts = [] }) {
  return (
    <div className="post-list">
      {posts.length === 0 ? (
        <p className="post-list-empty">
          No posts found. Be the first to create one!
        </p>
      ) : (
        posts.map((post) => (
          <Fragment key={post._id || post.id}>
            <Post id={post._id || post.id} {...post} />
            <hr className="post-list-divider" />
          </Fragment>
        ))
      )}
    </div>
  );
}
PostList.propTypes = {
  posts: PropTypes.arrayOf(PropTypes.shape(Post.propTypes).isRequired),
};
