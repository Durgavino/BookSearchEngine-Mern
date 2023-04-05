import React, { useState, useEffect } from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';
import { useQuery,useMutation } from'@apollo/react-hooks';
import {QUERY_ME} from '../utils/queries';
//import { getMe, deleteBook } from '../utils/API';
//import { getMe } from '../utils/queries';
import {removeBook} from '../utils/mutations';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';

const SavedBooks = () => {
 // const [userData, setUserData] = useState({});
const{ loading,data }=useQuery(QUERY_ME);
const [remove_Book,{error}]=useMutation(removeBook);

const userList=data?.me || [];
  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      return false;
    }

    try {
      //const response = await remove_Book(bookId, token);
      
      // if (!response.ok) {
      //   throw new Error('something went wrong!');
      // }
      const { data } = await removeBook({
        // variables: { input: { ...bookId } },
        variables: { bookId },
      });

           // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

 // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }
 

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userList.savedBooks.length
            ? `Viewing ${userList.savedBooks.length} saved ${userList.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userList.savedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;