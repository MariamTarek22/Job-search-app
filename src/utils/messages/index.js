const generateMessages = (entity) => ({
  //global entities messages
  notFound: `${entity} not found`,
  alreadyExist: `${entity} already exists`,
  createdSuccessfully: `${entity} created successfully`,
  updatedSuccessfully: `${entity} updated successfully`,
  deletedSuccessfully: `${entity} deleted successfully`,
  failToCreate: `Fail to create ${entity}`,
  failToUpdate: `Fail to update ${entity}`,
  failToDelete: `Fail to delete ${entity}`,
});

export const messages = {
  user: {
    ...generateMessages("User"),
    incorrectPassword: "incorrect password", //add a special message for a special entity
  },
  message: generateMessages("Message"), 
  otp: generateMessages("OTP"),
};
