import { IWorkout } from '../models/workout';
import OpenAI from 'openai';
import fs from 'fs/promises';
import dotenv from 'dotenv';
import { logger } from '../middleware/loggingMiddleware'

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function encodeImage(imagePath: string): Promise<string> {
  logger.info('Starting image encoding', { imagePath });
  try {
    const imageBuffer = await fs.readFile(imagePath);
    logger.info('Image read successfully', { imagePath, bufferSize: imageBuffer.length });
    const base64String = imageBuffer.toString('base64');
    logger.info('Image encoded to base64 successfully', { imagePath, base64Length: base64String.length });
    return base64String;
  } catch (error) {
    logger.error('Error encoding image', { imagePath, error });
    throw error;
  }
}

export const getWorkoutFromVision = async (date: string, imagePath: string): Promise<IWorkout> => {
  logger.info('Starting getWorkoutFromVision', { date, imagePath });
  try {
    const base64Image = await encodeImage(imagePath);
    logger.info('Image encoded successfully', { imagePath });

    logger.info('Sending request to OpenAI API');
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this image and return the workout data in the following JSON format:
              {
                "date": "${date}",
                "name": "AI Vision Workout",
                "exercises": [
                  {
                    "name": "<exercise name>",
                    "sets": [
                      {
                        "reps": <number of reps>,
                        "weight": <weight used>
                      },
                      ...
                    ]
                  },
                  ...
                ]
              }
              Include all exercises and sets visible in the image. Note you might get stuff like 3x10 format sometimes. Assume the first number is the sets, and the later the reps. In this case we would have 3 sets of 10 reps each. When no weight, use 0. ONLY return the data in JSON format. DO NOT include any other information.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });
    logger.info('Received response from OpenAI API', { responseStatus: response.choices[0].finish_reason });

    const content = response.choices[0].message.content;
    if (!content) {
      logger.error('No content in OpenAI response');
      throw new Error('No content in OpenAI response');
    }
    logger.info('OpenAI response content received', { contentLength: content.length });

    // Log the first 100 characters of the raw content
    logger.info('Raw OpenAI response content preview', { 
      contentPreview: content.substring(0, 100)
    });

    // Clean the content by removing markdown code blocks
    const cleanedContent = content.replace(/```json\n|\n```/g, '').trim();
    logger.info('Cleaned content', { cleanedContentLength: cleanedContent.length });

    logger.info('Parsing OpenAI response content');
    let workoutData: IWorkout;
    try {
      workoutData = JSON.parse(cleanedContent) as IWorkout;
      logger.info('OpenAI response parsed successfully', { 
        workoutName: workoutData.name, 
        exerciseCount: workoutData.exercises.length 
      });
    } catch (parseError) {
      logger.error('Error parsing OpenAI response', { 
        error: parseError,
        cleanedContentPreview: cleanedContent.substring(0, 100) // Log first 100 characters of cleaned content
      });
      throw parseError;
    }

    // Convert the parsed data to match our IWorkout interface
    const formattedWorkout: IWorkout = {
      date: new Date(workoutData.date),
      name: workoutData.name,
      exercises: workoutData.exercises.map(exercise => ({
        name: exercise.name,
        sets: exercise.sets.map(set => ({
          reps: set.reps,
          weight: set.weight
        }))
      }))
    };
    logger.info('Workout data formatted successfully', { 
      date: formattedWorkout.date, 
      name: formattedWorkout.name, 
      exerciseCount: formattedWorkout.exercises.length 
    });

    return formattedWorkout;
  } catch (error) {
    logger.error('Error in getWorkoutFromVision', { 
      date, 
      imagePath, 
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    });
    throw error;
  }
};