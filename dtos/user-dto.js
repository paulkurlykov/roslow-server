const createUserDto = (user) => ({
    id: user?.id,
    email: user?.email,
  });
  
  module.exports = createUserDto;

