import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { format } from "date-fns";
import { BsThreeDots } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import LikeAndUnlikeBtn from "../../UI/LikeAndUnlikeBtn";
import Card from "../../UI/Card";
import { AppContext } from "../../helper/context";

const SinglePostDetail = ({ post, userInfo }) => {
  const { setGetLogin, deleteHandler } = useContext(AppContext);
  const navigate = useNavigate();
  const [comments, setComments] = useState(post.data.comments);
  const [like, setLikes] = useState(post.data.likes);
  const [dislike, setDislikes] = useState(post.data.dislikes);
  const commentRef = useRef();
  const [postedComment, setPostedComment] = useState(false);
  const [action, setAction] = useState(false);

  const postReaction = (input, id) => {
    fetch(process.env.REACT_APP_API_URL+`/api/post/${id}/reaction`, {
      method: "POST",
      body: JSON.stringify(input),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
  };

  const likeHandler = () => {
    setAction(true);
    const reaction = {
      like: true,
      dislike: false,
    };
    postReaction(reaction, post.data.postId);
  };

  const unlikeHandler = () => {
    setAction(true);
    const reaction = {
      like: false,
      dislike: true,
    };

    postReaction(reaction, post.data.postId);
  };

  const getLikesHandler = useCallback(async (id) => {
    const response = await fetch(process.env.REACT_APP_API_URL+`/api/post/${id}/likes`);
    if (!response.ok) {
      throw new Error("Something went wrong!");
    }
    const data = await response.json();
    setLikes(data);
  }, []);

  const getUnlikeHandler = useCallback(async (id) => {
    const response = await fetch(
      process.env.REACT_APP_API_URL+`/api/post/${id}/unlikes`
    );
    if (!response.ok) {
      throw new Error("Something went wrong!");
    }
    const data = await response.json();
    setDislikes(data);
  }, []);

  async function deletePostHandler(id) {
    deleteHandler(id)
    navigate("/");
  }

  const deleteCommentHandler = async (id) => {
    setGetLogin(true);
    await fetch(process.env.REACT_APP_API_URL+"/api/delete-comment/" + id, {
      method: "DELETE",
    });
    const deletedComment = comments.filter((comment) => comment._id !== id);
    setComments(deletedComment);
  };

  const postCommentHandler = (e) => {
    e.preventDefault();

    const comment = {
      content: commentRef.current.value,
    };

    fetch(process.env.REACT_APP_API_URL+`/api/posts/${post.data.postId}/comment`, {
      method: "POST",
      body: JSON.stringify(comment),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    commentRef.current.value = "";
    setPostedComment(true);
    getCommentsHandler();
  };

  const getCommentsHandler = useCallback(async () => {
    const response = await fetch(
      process.env.REACT_APP_API_URL+`/api/post/${post.data.postId}/comments`
    );
    if (!response.ok) {
      throw new Error("Something went wrong!");
    }
    const data = await response.json();
    setComments(data);
  }, [post.data.postId, setComments]);

  useEffect(() => {
    getCommentsHandler();
    setPostedComment(false);
  }, [postedComment, getCommentsHandler]);

  useEffect(() => {
    setGetLogin(true);
  }, [setGetLogin]);

  useEffect(() => {
    getLikesHandler(post.data.postId);
    getUnlikeHandler(post.data.postId);
    setAction(false);
  }, [getLikesHandler, getUnlikeHandler, post.data.postId, action]);

  return (
    <div className="singlePageWrapper">
      <article>
        {post && post.data.image && (
          <img
            src={process.env.REACT_APP_API_URL+"/uploads/" + post.data.image}
            className="post-img w-100 singlePageImg"
            alt={post.content}
          />
        )}
        <time className=" d-block my-1">
          {format(new Date(post.data.createdAt), "MMM d, HH:mm")}
        </time>
        <p>{post.data.content}</p>

        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className=" d-flex justify-content-start  align-items-center">
            <LikeAndUnlikeBtn
              onLike={likeHandler}
              onUnlike={unlikeHandler}
              like={like}
              dislike={dislike}
            />
          </div>

          <div className="cursor-pointer">
            <BsThreeDots className="post--icon" />
          </div>
        </div>

        {userInfo.id === post.data.author ? (
          <menu className="mt-4">
            <Link to="edit" className="btn btn-primary">
              Edit
            </Link>
            <button
              onClick={() => deletePostHandler(post.data.postId)}
              className="btn btn-primary ms-3"
            >
              Delete
            </button>
          </menu>
        ) : (
          <div className="w-50 mt-4">
            <Link to="/" className="btn btn-primary">
              Back to Home Page
            </Link>
          </div>
        )}

        <div>
          <form className="my-4">
            <legend className="">Add Comment</legend>
            <input
              type="text"
              className="form-control input-outline"
              ref={commentRef}
            />
            <button
              className="btn btn-primary mt-1"
              onClick={postCommentHandler}
            >
              Post comment
            </button>
          </form>

          <div>
            {comments.map((comment, index) => {
              return (
                <Card
                  className="p-2 p-lg-3 mb-2 border-0 rounded-0 border-bottom"
                  key={comment.authorId + index + "C"}
                >
                  <div className="d-flex justify-content-between">
                    <div className="d-flex">
                      <figure className="">
                        <img
                          className="img-fluid img--profile--thumbnail"
                          src={
                            process.env.REACT_APP_API_URL+"/uploads/" +
                            comment.authorId.image
                          }
                          alt="default png"
                        />
                      </figure>
                      <div className="ps-1 ps-lg-2">
                        <div className="fw-bold">
                          {comment.authorId.name} •{" "}
                          <span className="font-tiny fw-normal">
                            {format(
                              new Date(comment.createdAt),
                              "MMM d, HH:mm"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      {userInfo.id === comment.authorId._id && (
                        <button
                          type="button"
                          className="btn-close"
                          aria-label="Close"
                          onClick={() => deleteCommentHandler(comment._id)}
                        ></button>
                      )}
                    </div>
                  </div>
                  <div>
                    <article className="clearfix">
                      <p className="">{comment.content}</p>
                    </article>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </article>
    </div>
  );
};

export default SinglePostDetail;
