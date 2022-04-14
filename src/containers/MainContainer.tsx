import React, {useState, useMemo, useCallback, useEffect} from 'react';
import moment, {Moment} from 'moment';
import {View, StyleSheet} from 'react-native';
import {
  Button,
  RadioButton,
  ActivityIndicator,
  Paragraph,
  Title,
} from 'react-native-paper';
import {propOr, map} from 'ramda';
import {SafeAreaView} from 'react-native-safe-area-context';

import {useGetQuestionsQuery} from '../redux/services/questions';
import {shuffleArray} from '../utils';
import {Question} from '../redux/services/types';

interface PreparedQuestion extends Question {
  answers: string[];
  selectedAnswer?: string;
}

const prepareQuestion = (item: Question): PreparedQuestion => ({
  ...item,
  answers: shuffleArray([item.correctAnswer, ...item.incorrectAnswers]),
});

export const MainContainer = () => {
  const {data, isLoading} = useGetQuestionsQuery();

  const [deadline, setDeadline] = useState<Moment>();
  const [counter, setCounter] = useState(15);
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [displayedQuestions, setDisplayedQuestions] = useState<
    PreparedQuestion[]
  >([]);

  useEffect(() => {
    if (displayedQuestions.length > 0) {
      setCurrentQuestionIndex(displayedQuestions.length - 1);
    }
  }, [displayedQuestions]);

  useEffect(() => {
    setDeadline(moment().add(15, 'seconds'));
  }, [displayedQuestions.length]);

  const currentQuestion = useMemo(() => {
    return displayedQuestions[currentQuestionIndex];
  }, [displayedQuestions, currentQuestionIndex]);

  const questionText = useMemo(
    () => propOr('', 'question', currentQuestion),
    [currentQuestion],
  );
  const category = useMemo(
    () => propOr('', 'category', currentQuestion),
    [currentQuestion],
  );
  const difficulty = useMemo(
    () => propOr('', 'difficulty', currentQuestion),
    [currentQuestion],
  );

  const handleSelectAnswer = useCallback(
    value => {
      if (currentQuestion.selectedAnswer === undefined) {
        displayedQuestions[currentQuestionIndex].selectedAnswer = value;
        setDisplayedQuestions(displayedQuestions);
        if (value === displayedQuestions[currentQuestionIndex].correctAnswer) {
          setScore(prevValue => prevValue + 10);
        } else {
          setScore(prevValue => prevValue - 5);
        }
      }
    },
    [displayedQuestions, currentQuestionIndex, currentQuestion],
  );

  const handleNext = useCallback(() => {
    if (
      currentQuestionIndex === displayedQuestions.length - 1 &&
      currentQuestion.selectedAnswer !== undefined &&
      data &&
      displayedQuestions.length !== data.length
    ) {
      setDisplayedQuestions([
        ...displayedQuestions,
        prepareQuestion(data[displayedQuestions.length]),
      ]);
    } else if (currentQuestionIndex < displayedQuestions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    }
  }, [displayedQuestions, data, currentQuestion, currentQuestionIndex]);

  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex(prevVal => {
      if (prevVal > 0) {
        return prevVal - 1;
      }
      return prevVal;
    });
  }, []);

  useEffect(() => {
    setCounter(moment(deadline).diff(moment(), 'seconds'));
    const interval = setInterval(() => {
      const timeDiff = moment(deadline).diff(moment(), 'seconds');
      if (timeDiff > 0) {
        setCounter(timeDiff);
      } else {
        clearInterval(interval);
        handleSelectAnswer(null);
        handleNext();
        setCounter(0);
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline]);

  useEffect(() => {
    if (data) {
      setDisplayedQuestions([prepareQuestion(data[0])]);
    }
  }, [data]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {isLoading && <ActivityIndicator size="large" />}
      {currentQuestion && (
        <View style={styles.container}>
          <View>
            <Title>Score: {score}</Title>
            <Title>Remaining Time: {counter}</Title>
            <Paragraph>Category: {category}</Paragraph>
            <Paragraph>Difficulty: {difficulty}</Paragraph>
            <View style={styles.separator} />
            <Title>
              Question #{currentQuestionIndex + 1}: {questionText}
            </Title>
            <RadioButton.Group
              onValueChange={handleSelectAnswer}
              value={currentQuestion.selectedAnswer || ''}>
              {map(
                item => (
                  <RadioButton.Item
                    mode="android"
                    key={item}
                    label={item}
                    value={item}
                    disabled={
                      currentQuestionIndex < displayedQuestions.length - 1
                    }
                    color={
                      item === currentQuestion.correctAnswer ? 'green' : 'red'
                    }
                  />
                ),
                currentQuestion.answers,
              )}
            </RadioButton.Group>
          </View>
          <View style={styles.buttonContainer}>
            <Button
              disabled={currentQuestionIndex === 0}
              onPress={handlePrevious}>
              Previous
            </Button>
            <Button
              disabled={data && currentQuestionIndex === data.length - 1}
              onPress={handleNext}>
              Next
            </Button>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  separator: {
    height: 30,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
