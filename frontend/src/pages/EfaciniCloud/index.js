import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '2rem',
    [theme.breakpoints.down('sm')]: {
      margin: '1rem',
    },
  },
}));

const EmbeddedContent = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <iframe 
        src="http://cht.facilityai.com.br/efacini" 
        width="450px" 
        height="800px" 
        frameBorder="0"
      ></iframe>
    </div>
  );
};

export default EmbeddedContent;
