interface ErrorType {
  message: string;
}

const handleError = (error: unknown): ErrorType => {
  if (error instanceof Error) {
    throw new Error(error.message);
  } else {
    throw new Error('Unknown error has occured')
  }
}

export default handleError

