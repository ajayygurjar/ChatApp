const generateRoomId = (email1, email2) => {
  return [email1, email2].sort().join("_");
};

export default generateRoomId;
