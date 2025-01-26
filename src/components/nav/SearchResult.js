import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import UserCard from '../../features/friend/UserCard';
import { useLocation } from 'react-router-dom';
import { getUsers } from '../../features/friend/friendSlice';
import { Grid } from '@mui/material';

  function SearchResult() {
    const [filterName, setFilterName] = useState("");
    const [page, setPage] = React.useState(1);
  
    const { currentPageUsers, usersById, totalUsers, totalPages } = useSelector(
      (state) => state.friend
    );
    const users = currentPageUsers.map((userId) => usersById[userId]);
    const dispatch = useDispatch();
  
    const handleSubmit = (searchQuery) => {
      setFilterName(searchQuery);
    };


  useEffect(() => {
    dispatch(getUsers({ filterName, page }));
  }, [filterName, page, dispatch]);
  
  
    return (
        <Grid container spacing={3} my={1}>
        {users.map((user) => (
          <Grid key={user._id} item xs={12} md={4}>
            <UserCard profile={user} />
          </Grid>
        ))}
      </Grid>
    );
  }
  
  export default SearchResult;

  
  
  
  
  