import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  getThing,
  removeThing,
  setThing,
  createSolidDataset,
  getSolidDataset,
  saveSolidDatasetAt
} from '@inrupt/solid-client';

/**
 * The return value of useRdfCollection
 *
 * @typedef {object} RdfCollection
 * @property {boolean} isLoading - is the collection loading
 * @property {boolean} isSuccess - is the collection available
 * @property {boolean} isError - did the collection fetch error
 * @property {*} data - the data generated by the parse function
 * @property {object | null} error - the error object, if any
 * @property {Function} add - function to add a thing to the dataset
 * @property {Function} delete - function to remove a thing from the dataset. Takes the `name` of the thing to be removed
 */

/**
 * useRdfCollection - This hook can be used directly in React components, although it is designed to act as a compositional aid when creating more specialized hooks, which can then directly expose simple interfaces to components.
 *
 * @function useRdfCollection
 * @param {Function} parse - used to convert a solid dataset into a user-defined value
 * @param {Function} serialize - convert a model into a thing to add to the solid dataset
 * @param {URL | string} fileUrl - the URL of the solid dataset to use
 * @param {Function} fetchData - override for default fetch function
 * @returns {RdfCollection} - The information returned from the fetch
 */
const useRdfCollection = (parse, serialize, fileUrl, fetchData) => {
  const [storedDataset, setStoredDataset] = useState(null);
  const queryClient = useQueryClient();

  const saveData = async (dataset) => {
    const savedDataset = await saveSolidDatasetAt(fileUrl.toString(), dataset, {
      fetch: fetchData
    });
    setStoredDataset(savedDataset);
    return parse(savedDataset);
  };

  const fetchDocument = async () => {
    let myDataset;
    try {
      myDataset = await getSolidDataset(fileUrl.toString(), { fetch: fetchData });
    } catch (e) {
      if (e.response.status === 404) {
        myDataset = createSolidDataset();
        myDataset = await saveSolidDatasetAt(fileUrl.toString(), myDataset, { fetch: fetchData });
      } else {
        throw e;
      }
    }
    setStoredDataset(myDataset);
    return parse(myDataset);
  };

  const { isLoading, isError, error, data, isSuccess, refetch } = useQuery({
    queryKey: [fileUrl?.toString()],
    queryFn: fetchDocument
  });

  const addMutation = useMutation({
    mutationFn: async (item) => {
      if (!data) await fetchDocument();
      const thing = serialize(item);
      const newDataset = setThing(storedDataset, thing);
      const savedDataset = await saveData(newDataset);
      return savedDataset;
    },
    onSuccess: (resData) => {
      queryClient.setQueryData([fileUrl.toString()], () => resData);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (itemId) => {
      const itemUrl = fileUrl;
      itemUrl.hash = encodeURIComponent(itemId);
      const thingToRemove = getThing(storedDataset, itemUrl.toString());
      const newDataset = removeThing(storedDataset, thingToRemove);
      const newDocument = await saveData(newDataset);
      return newDocument;
    },
    onSuccess: (resData) => {
      queryClient.setQueryData([fileUrl.toString()], () => resData);
    }
  });

  return {
    isLoading,
    isError,
    isSuccess,
    error,
    data,
    storedDataset,
    refetch,
    add: addMutation.mutate,
    delete: deleteMutation.mutate
  };
};

export default useRdfCollection;
