//const expiresAt = '2024-06-24 12:34:56'; // Example of the expiresAt string stored in the database

export const isSessionExpired = (expiresAt: string): boolean => {
  // "Z" ensures that UTC is preserved, weird stuff due to time zones in sqlite or drizzle ORM.
  // Without it, expiresAt would subtract three hours resulting in bugs for smaller TTL.

  const expiresAtDate = new Date(expiresAt.replace(" ", "T") + "Z");

  //console.log("Inside isSessionExpired 1:", expiresAtDate);
  //console.log("Inside isSessionExpired 2:", new Date(Date.now()).toISOString());

  return expiresAtDate.getTime() <= Date.now();
};
