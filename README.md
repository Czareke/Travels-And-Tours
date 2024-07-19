

Travels and Tours API

This is a Node.js API for managing tours, user bookings, and handling payments using Stripe. 
Features

- User Authentication (signUp, login)
- CRUD operations for Tours
- Booking Tours
- Payment Processing with Stripe

Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- Stripe

Getting Started

Prerequisites

- Node.js installed
- MongoDB installed and running
- Stripe account

Installation

1. Clone the repository:
bash
git clone 
cd travels-and-tours-api


2. Install dependencies:
bash
npm install

3. Set up environment variables:

Create a `.env` file in the root of the project and add the following:

env
NODE_ENV=development
PORT=3000
DATABASE=mongodb://localhost:27017/travels-and-tours
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
STRIPE_SECRET_KEY=your_stripe_secret_key


Running the API

bash
npm start
The API will be running on `http://localhost:3000`.

API Endpoints

 Authentication
- Signup: `POST /api/v1/users/signup`
  Login: `POST /api/v1/users/login`

 Tours

-Get All Tours: `GET /api/v1/tours`
- Get One Tour `GET /api/v1/tours/:id`
- Create Tour `POST /api/v1/tours`
- Update Tour `PATCH /api/v1/tours/:id`
- Delete Tour `DELETE /api/v1/tours/:id`

 Bookings

- Get User Bookings `GET /api/v1/bookings`
- Get One Booking `GET /api/v1/bookings/:id`
- Create Booking `POST /api/v1/bookings`
- Create and Confirm Payment `POST /api/v1/payments/create-and-confirm-payment`

 Payment

- Create and Confirm Payment Intent `POST /api/v1/payments/create-and-confirm-payment`

 Example Request
 Create and Confirm Payment

Endpoint

http
POST /api/v1/payments/create-and-confirm-payment


Body

json
{
  "tourId": "5f6b6c35a85a1a0017a2b2b2",
  "payment_method_id": "pm_card_visa"
}


Response

json
{
  "status": "success",
  "data": {
    "booking": {
      "_id": "5f6b6c35a85a1a0017a2b2b3",
      "tour": "5f6b6c35a85a1a0017a2b2b2",
      "user": "5f6b6c35a85a1a0017a2b2b1",
      "price": 2000,
      "__v": 0
    }
  }
}

 Acknowledgments

- [Stripe](https://stripe.com/docs) for payment processing

---

Feel free to customize the README according to your specific project needs and repository details.
