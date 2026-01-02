import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./Post.css";

export function Post({ id, title, contents, author }) {
  return (
    <article className="post">
      <h3 className="post-title">
        <Link to={`/posts/${id}`} className="post-title-link">
          {title}
        </Link>
      </h3>
      <div className="post-content">{contents}</div>
      {author && (
        <em className="post-author">
          <br />
          Written by: <strong>{author}</strong>
        </em>
      )}
    </article>
  );
}

Post.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  contents: PropTypes.string,
  author: PropTypes.string,
};
