<!-- creating questions in one go, render quiz -->

Your task is to create french exercises in a JSON format based on the interfaces from @src/components/quiz/Quiz.tsx and an example json to help you from @src/data/exercises/a1-7avoir.json

Create 20 questions focused on adverbs, with all being free response (fill in the blank style, where a french sentence is the question and filling in that blank is the free response), where the answer should just the single adverb. Some should have the user writing the correct adverb based on the adjective form, some should include adverbs of time and irregular adverbs.

after creating the exercise, I want you to add all necessary imports to the Quiz.tsx component and augment the QuizProps interface with the new exercise name and JSON.

<!-- render quiz only -->

I just added @a1-13adverbs.json , so now add it to the quizPropMap in @Quiz.tsx and render quiz in @13-adverbs.md
