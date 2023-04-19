export const getUsernameFromUser = ({ email }: { email: string }) => {
  const [username] = email.split("@");
  return username ?? "none";
};
