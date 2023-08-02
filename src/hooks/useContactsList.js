import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStringNoLocale,
  getThing,
  removeThing,
  getThingAll,
  getUrl,
  buildThing,
  createThing,
  setThing,
  createSolidDataset,
  getSolidDataset,
  saveSolidDatasetAt
} from '@inrupt/solid-client';
import { RDF_PREDICATES } from '@constants';
import useSession from './useSession';

const makeContactIntoThing = ({ username, givenName, familyName, webId }) =>
  buildThing(createThing({ name: username }))
    .addStringNoLocale(RDF_PREDICATES.Person, `${givenName} ${familyName}`)
    .addStringNoLocale(RDF_PREDICATES.givenName, givenName)
    .addStringNoLocale(RDF_PREDICATES.familyName, familyName)
    .addStringNoLocale(RDF_PREDICATES.alternateName, username)
    .addUrl(RDF_PREDICATES.identifier, webId)
    .addUrl(RDF_PREDICATES.URL, webId.split('profile')[0])
    .build();

const parseContacts = (data) => {
  const contactThings = getThingAll(data);
  const contacts = [];
  contactThings.forEach((thing) => {
    const contact = {};

    contact.webId = getUrl(thing, RDF_PREDICATES.identifier);
    contact.podUrl = getUrl(thing, RDF_PREDICATES.URL);
    contact.givenName = getStringNoLocale(thing, RDF_PREDICATES.givenName);
    contact.familyName = getStringNoLocale(thing, RDF_PREDICATES.familyName);
    contact.username = getStringNoLocale(thing, RDF_PREDICATES.alternateName);
    contact.person = getStringNoLocale(thing, RDF_PREDICATES.Person);
    contacts.push(contact);
  });
  return contacts;
};

/**
 *
 * @returns {object} - all the data provided by the useQuery call
 */
const useContactsList = () => {
  const queryClient = useQueryClient();
  const { session, podUrl } = useSession();
  const { fetch } = session;
  const url = new URL('PASS/Users/userlist.ttl', podUrl).toString();

  const saveData = async (dataset) => {
    const savedDataset = await saveSolidDatasetAt(url, dataset, {
      fetch
    });
    return savedDataset;
  };

  const fetchContactsList = async () => {
    let myDataset;
    try {
      myDataset = await getSolidDataset(url, { fetch });
    } catch (e) {
      if (e.response.status === 404) {
        myDataset = createSolidDataset();
        myDataset = await saveSolidDatasetAt(url, myDataset, { fetch });
      }
      throw e;
    }
    return myDataset;
  };

  const { isLoading, isError, error, data } = useQuery({
    queryKey: [url],
    queryFn: fetchContactsList
  });

  const addContactMutation = useMutation({
    mutationFn: async (newContact) => {
      const thing = makeContactIntoThing(newContact);
      const newDataset = setThing(data, thing);
      const savedDataset = await saveData(newDataset);
      return savedDataset;
    },
    onSuccess: (resData) => {
      queryClient.setQueryData([url], () => resData);
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactToDelete) => {
      const thingUrl = `${url}#${contactToDelete.username}`;
      const thingToRemove = getThing(data, thingUrl);
      const newDataset = removeThing(data, thingToRemove);
      const savedDataset = await saveData(newDataset);
      return savedDataset;
    },
    onSuccess: (resData) => {
      queryClient.setQueryData([url], () => resData);
    }
  });

  return {
    isLoading,
    isError,
    error,
    data: !(isLoading || isError) ? parseContacts(data) : [],
    deleteContact: deleteContactMutation.mutate,
    addContact: addContactMutation.mutate
  };
};

export default useContactsList;