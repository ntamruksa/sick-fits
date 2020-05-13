import React from 'react';
import ResetPassword from '../components/Reset'

const Reset = props => {
  return (
    <ResetPassword resetToken={props.query.resetToken}/>
  );
};

export default Reset;