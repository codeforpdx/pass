import {
  getSolidDataset,
  createThing,
  buildThing,
  setThing,
  createSolidDataset,
  getThingAll,
  saveSolidDatasetAt,
  getStringNoLocale,
  getUrl,
  getDatetime,
  removeThing,
  getPodUrlAll
} from '@inrupt/solid-client';

import { setDocAclForUser } from './network/session-helper';

import { RDF_PREDICATES } from '../constants';

/**
 * @typedef {import('@inrupt/solid-ui-react').SessionContext} Session
 */

/**
 * @typedef {import("../typedefs").userListObject} userListObject
 */

const createUsersList = async (session, usersListUrl) => {
  const newUsersList = buildThing(createThing({ name: 'userlist' }))
    .addStringNoLocale(RDF_PREDICATES.name, 'Users List')
    .addStringNoLocale(RDF_PREDICATES.description, 'A list of users')
    .build();

  let newSolidDataset = createSolidDataset();
  newSolidDataset = setThing(newSolidDataset, newUsersList);

  // Generate document.ttl file for container
  const usersListDataset = await saveSolidDatasetAt(usersListUrl, newSolidDataset, {
    contentType: 'text/turtle',
    fetch: session.fetch
  });

  // Generate ACL file for container
  await setDocAclForUser(session, usersListUrl);
  return usersListDataset;
};

const parseUserObjectFromThing = (userThing) => {
  const person = getStringNoLocale(userThing, RDF_PREDICATES.Person);
  const givenName = getStringNoLocale(userThing, RDF_PREDICATES.givenName);
  const familyName = getStringNoLocale(userThing, RDF_PREDICATES.familyName);
  const webId = getUrl(userThing, RDF_PREDICATES.identifier);
  const podUrl = getUrl(userThing, RDF_PREDICATES.URL);
  return { person, givenName, familyName, webId, podUrl };
};

/**
 * Function that gets a list of users from their Solid Pod stored inside the
 * Solid container named User
 *
 * @memberof utils
 * @function getUsersFromPod
 * @param {Session} session - Solid's Session Object {@link Session}
 * @returns {Promise} Promise - An array of users from their Pod into PASS, if
 * users list exist
 */

export const getUsersFromPod = async (session, podUrl) => {
  const userListUrl = `${podUrl}Users/userlist.ttl`;
  let userList = [];
  try {
    const solidDataset = await getSolidDataset(userListUrl, {
      fetch: session.fetch
    });

    const allUsersThing = getThingAll(solidDataset).filter(
      (thing) => !thing.url.includes('#userlist')
    );

    allUsersThing.forEach((userThing) => {
      const userObject = parseUserObjectFromThing(userThing);
      userList.push(userObject);
    });
  } catch {
    await createUsersList(session, userListUrl);
    userList = [];
  }

  return userList;
};

/**
 * Function that removes a user from the users list from their Solid Pod stored
 * inside the Solid container named User
 *
 * @memberof utils
 * @function deleteUserFromPod
 * @param {Session} session - Solid's Session Object {@link Session}
 * @param {string} userToDelete - Name of user to be removed from list
 * @param {URL} userToDeleteUrl - URL of the user's Pod you wish to delete
 * @returns {Promise} Promise - Removes user with userToDeleteUrl from users list in
 * their Solid Pod
 */

export const deleteUserFromPod = async (session, user, podUrl) => {
  const userContainerUrl = `${podUrl}Users/`;
  let solidDataset = await getSolidDataset(`${userContainerUrl}userlist.ttl`, {
    fetch: session.fetch
  });
  const ttlFileThing = getThingAll(solidDataset);
  const userToDeleteThing = ttlFileThing.find(
    (thing) => getUrl(thing, RDF_PREDICATES.identifier) === user.webId
  );

  solidDataset = removeThing(solidDataset, userToDeleteThing);

  await saveSolidDatasetAt(`${userContainerUrl}userlist.ttl`, solidDataset, {
    fetch: session.fetch
  });

  const userList = await getUsersFromPod(session, podUrl);
  return userList;
};

/**
 * Function that adds a user from the users list from their Solid Pod stored
 * inside the Solid container named User, or create the container User with the
 * user if container doesn't exist to begin with
 *
 * @memberof utils
 * @function addUserToPod
 * @param {Session} session - Solid's Session Object {@link Session}
 * @param {object} userObject - Object containing the user's name and Pod URL
 * @returns {Promise} Promise - Adds users with their Pod URL onto users list in
 * their Solid Pod
 */

export const addUserToPod = async (session, userObject, podUrl) => {
  const userContainerUrl = `${podUrl}Users/`;

  let solidDataset = await getSolidDataset(`${userContainerUrl}userlist.ttl`, {
    fetch: session.fetch
  });

  const { givenName, familyName, username, webId } = userObject;

  let newUserPodUrl = null;
  try {
    [newUserPodUrl] = await getPodUrlAll(webId);
  } catch {
    [newUserPodUrl] = webId.split('profile');
  }

  newUserPodUrl = newUserPodUrl || webId.split('profile')[0];

  const newUserThing = buildThing(createThing({ name: `${username}` }))
    .addStringNoLocale(RDF_PREDICATES.Person, `${givenName} ${familyName}`)
    .addStringNoLocale(RDF_PREDICATES.givenName, givenName)
    .addStringNoLocale(RDF_PREDICATES.familyName, familyName)
    .addUrl(RDF_PREDICATES.identifier, webId)
    .addUrl(RDF_PREDICATES.URL, newUserPodUrl)
    .build();

  solidDataset = setThing(solidDataset, newUserThing);

  await saveSolidDatasetAt(`${userContainerUrl}userlist.ttl`, solidDataset, {
    fetch: session.fetch
  });

  const userList = await getUsersFromPod(session, podUrl);
  return userList;
};

/**
 * Function that fetches a user's last active time on their Solid Pod
 *
 * @memberof utils
 * @function getUserListActivity
 * @param {Session} session - Solid's Session Object {@link Session}
 * @param {userListObject[]} userList - An array of {@link userListObject}
 * which stores the name and their Pod URL
 * @returns {Promise<userListObject[]>} Promise - An array of users with last active
 * time included to user list
 */

export const getUserListActivity = async (session, userList) => {
  const userListWithTime = await Promise.all(
    userList.map(async (user) => {
      const activityUrl = `${user.podUrl}public/active.ttl`;
      try {
        const solidDataset = await getSolidDataset(activityUrl, {
          fetch: session.fetch
        });
        const activeThing = getThingAll(solidDataset)[0];
        const updatedUser = user;
        updatedUser.dateModified = getDatetime(activeThing, RDF_PREDICATES.dateModified);
        return updatedUser;
      } catch {
        return user;
      }
    })
  );

  return userListWithTime;
};

/**
 * Function that updates a user's last active time on Solid Pod
 *
 * @memberof utils
 * @function updateUserActivity
 * @param {Session} session - Solid's Session Object {@link Session}
 * @returns {Promise} Promise - Updates last active time of user to lastActive.ttl
 */

export const updateUserActivity = async (session, podUrl) => {
  const activityDocUrl = `${podUrl}public/active.ttl`;
  let activityDataset;

  const updateAndSaveActivity = async () => {
    const activity = buildThing(createThing({ name: 'active' }))
      .addDatetime(RDF_PREDICATES.dateModified, new Date())
      .build();

    activityDataset = setThing(activityDataset, activity);

    await saveSolidDatasetAt(activityDocUrl, activityDataset, {
      fetch: session.fetch
    });
  };

  try {
    activityDataset = await getSolidDataset(activityDocUrl, { fetch: session.fetch });
    await updateAndSaveActivity();
  } catch {
    activityDataset = createSolidDataset();
    await updateAndSaveActivity();
    const accessObject = {
      read: true,
      append: true,
      write: true,
      control: true
    };
    const publicAccessObject = {
      read: true,
      append: false,
      write: false,
      control: false
    };
    await setDocAclForUser(
      session,
      activityDocUrl,
      'create',
      session.info.webId,
      accessObject,
      publicAccessObject
    );
  }
};
