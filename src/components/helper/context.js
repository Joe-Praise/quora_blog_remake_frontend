import { createContext, useState, useEffect, useCallback } from "react";

export const AppContext = createContext();
function DataContext({ children }) {
  const [userInfo, setUserInfo] = useState({
    image: "",
    name: "",
    email: "",
    id: "",
  });
  const [adminUserInfo, setAdminUserInfo] = useState({
    image: "",
    name: "",
    email: "",
    id: "",
    position: "",
    department: "",
    phone: "",
    address: "",
    bio: "",
  });

  const [following, setFollowing] = useState([]);
  const [reload, setReload] = useState(false);
  const [posts, setPosts] = useState([]);
  const [getLogin, setGetLogin] = useState(false);
  const [adminLogin, setAdminLogin] = useState(false);
  const [filterSpace, setFilterSpace] = useState([]);
  const [users, setUsers] = useState([]);
  const [reloadAdmin, setReloadAdmin] = useState(false);
  const [reloadFollowing, setReloadFollowing] = useState(false);
  const [updatedPost, setUpdatedPost] = useState([]);
  const [getUsersForAdmin, setUsersForAdmin] = useState([]);

  const getProfile = useCallback(async () => {
    await fetch(process.env.REACT_APP_API_URL+"/profile", {
      credentials: "include",
    }).then((res) => {
      res.json().then((userInfo) => {
        if (userInfo.err === "Login to have access!") {
          return;
        } else {
          setUserInfo({
            email: userInfo[0].email,
            image: userInfo[0].image,
            name: userInfo[0].name,
            id: userInfo[0]._id,
          });
        }
      });
    });
    // eslint-disable-next-line
  }, [setUserInfo, getLogin]);

  const getAdminProfile = useCallback(async () => {
    await fetch(process.env.REACT_APP_API_URL+"/admin/admin-profile", {
      credentials: "include",
    }).then((res) => {
      res.json().then((adminInfo) => {
        if(adminInfo.err){
          return
        }else{
          setUsersForAdmin(true);
          setAdminUserInfo({
            email: adminInfo[0].email,
            image: adminInfo[0].image,
            name: adminInfo[0].name,
            id: adminInfo[0]._id,
            position: adminInfo[0].position,
            department: adminInfo[0].department,
            phone: adminInfo[0].phone,
            address: adminInfo[0].address,
            bio: adminInfo[0].bio,
          });
        }
      });
    });
    // eslint-disable-next-line
  }, [setAdminUserInfo, adminLogin]);

  const getPostsHandler = useCallback(async () => {
    fetch(process.env.REACT_APP_API_URL+`/api/posts`).then((res) => {
      res.json().then((posts) => {
        setPosts(posts.data);
        setFilterSpace(posts.data);
        setReload(false);
      });
    });
    // eslint-disable-next-line
  }, [reload]);

  const getUsers = useCallback((id) => {
    if (id) {
      fetch(process.env.REACT_APP_API_URL+"/api/users").then((res) => {
        res.json().then((users) => {
          setUsers(users.data);
        });
      });
    } else {
      return;
    }
  }, []);

  const deleteHandler = async (id) => {
    await fetch(process.env.REACT_APP_API_URL+"/api/delete-post/" + id, {
      method: "DELETE",
    });
    getPostsHandler();
  };

  const getFollowing = useCallback(
    async (id) => {
      if (!id) return;
      else {
        const response = await fetch(
          process.env.REACT_APP_API_URL+`/api/following/${id}`
        );
        const data = await response.json();
        setFollowing(data);
        setReloadFollowing(false);
      }
    },
    [setReloadFollowing]
  );

  function compile(post, following) {
    let copiedPost = [...post];
    for (let i = 0; i < following.length; i++) {
      const singleFollowed = following[i];
      for (let j = 0; j < post.length; j++) {
        if (singleFollowed.followee._id === post[j].authorId._id) {
          copiedPost[j].following = true;
        }
      }
    }

    setUpdatedPost(copiedPost);
    return copiedPost;
  }

  useEffect(() => {
    getProfile();
    getPostsHandler();
    getUsers(userInfo.id);
    getFollowing(userInfo.id);
  }, [getPostsHandler, getUsers, getFollowing, userInfo.id, getProfile]);

  useEffect(() => {
    if (getLogin) {
      getProfile();
    }
  }, [getProfile, getLogin]);

  useEffect(() => {
    if (reloadFollowing) {
      compile(posts, following);
    }
    compile(posts, following);
  }, [posts, following, reloadFollowing]);

  useEffect(() => {
    if (adminLogin) {
      getAdminProfile();
      setAdminLogin(false);
    }
    if (getUsersForAdmin) {
      fetch(process.env.REACT_APP_API_URL+"/api/users").then((res) => {
        res.json().then((users) => {
          setUsers(users.data);
        });
      });
    }
  }, [getAdminProfile, adminLogin, getUsers, adminUserInfo, getUsersForAdmin]);

  return (
    <AppContext.Provider
      value={{
        userInfo,
        setUserInfo,
        reload,
        setReload,
        posts,
        setPosts,
        following,
        getLogin,
        setGetLogin,
        setFilterSpace,
        filterSpace,
        getPostsHandler,
        users,
        getUsers,
        reloadAdmin,
        setReloadAdmin,
        getProfile,
        adminUserInfo,
        getAdminProfile,
        setAdminLogin,
        setAdminUserInfo,
        deleteHandler,
        setReloadFollowing,
        updatedPost,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
export default DataContext;
