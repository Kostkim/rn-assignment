// Need to use the React-specific entry point to import createApi
import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {RawQuestion, Question} from './types';

// Define a service using a base URL and expected endpoints
export const questionsApi = createApi({
  reducerPath: 'questionsApi',
  baseQuery: fetchBaseQuery({baseUrl: 'https://opentdb.com/api.php/'}),
  endpoints: builder => ({
    getQuestions: builder.query<Question[], void>({
      query: () => {
        return {
          url: '',
          params: {
            amount: 10,
          },
        };
      },
      transformResponse: (response: {results: RawQuestion[]}) =>
        response?.results?.map(
          ({correct_answer, incorrect_answers, ...rest}) => ({
            correctAnswer: correct_answer,
            incorrectAnswers: incorrect_answers,
            ...rest,
          }),
        ),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {useGetQuestionsQuery} = questionsApi;
