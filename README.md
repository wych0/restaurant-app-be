# NAVBAR - BACKEND
Restaurant management web application - backend.

## Table of Contents

- [Created With](#created-with)
- [Entity-Relationship Diagram](#enitity-relationship-diagram)
- [API Endpoints](#api-endpoints)
  - [Auth](#auth)
  - [Dish](#dish)
  - [Reservation](#reservation)
  - [User](#user)
- [License](#license)


## Created With
Server was created using **JavaScript**, **Node.js**, **Express.js** and **MongoDB**.

## Enitity-Relationship Diagram
<p align="center">
 <img width="700" height="350" alt="image" src="https://github.com/user-attachments/assets/94f54506-f782-423c-b0ed-f2cd869825f5" />
</p>

## API Endpoints

### Auth

#### Register
- **Method:** `POST`
- **Path:** `/auth/register`

#### Login
- **Method:** `POST`
- **Path:** `/auth/login`

#### Auto Login
- **Method:** `POST`
- **Path:** `/auth/autologin`

#### Logout
- **Method:** `POST`
- **Path:** `/auth/logout`

#### Refresh Token
- **Method:** `POST`
- **Path:** `/auth/refresh`

#### Check Auth
- **Method:** `GET`
- **Path:** `/auth/isAuth`

#### Activate Account
- **Method:** `POST`
- **Path:** `/auth/activate/:token`
- **Params:**
  - `token` - activation token

#### Resend Activation Email
- **Method:** `POST`
- **Path:** `/auth/resend-activation-email`

#### Request Password Recovery
- **Method:** `POST`
- **Path:** `/auth/send-recover-password-email`

#### Recover Password
- **Method:** `POST`
- **Path:** `/auth/recover/:token`
- **Params:**
  - `token` - recovery token

#### Check Recovery Token
- **Method:** `GET`
- **Path:** `/auth/check-recovery-token/:token`
- **Params:**
  - `token` - recovery token

---

### Dish

#### Get All Dishes
- **Method:** `GET`
- **Path:** `/dish/`
- **Auth:** Required - roles: `WORKER`, `MANAGER`

#### Get Dishes To Display
- **Method:** `GET`
- **Path:** `/dish/to-display`

#### Create Dish
- **Method:** `POST`
- **Path:** `/dish/`
- **Auth:** Required - roles: `WORKER`, `MANAGER`

#### Update Dish
- **Method:** `PUT`
- **Path:** `/dish/:id`
- **Params:**
  - `id` - dish ID  
- **Auth:** Required - roles: `WORKER`, `MANAGER`

#### Delete Dish
- **Method:** `DELETE`
- **Path:** `/dish/:id`
- **Params:**
  - `id` - dish ID  
- **Auth:** Required - role: `MANAGER`

---

### Reservation

#### Create Reservation
- **Method:** `POST`
- **Path:** `/reservation/`

#### Get All Reservations
- **Method:** `GET`
- **Path:** `/reservation/`
- **Auth:** Required - roles: `WORKER`, `MANAGER`

#### Get Available Hours
- **Method:** `GET`
- **Path:** `/reservation/availableHours`

#### Confirm Reservation
- **Method:** `POST`
- **Path:** `/reservation/confirm/:token`
- **Params:**
  - `token` - confirmation token

#### Cancel Reservation
- **Method:** `POST`
- **Path:** `/reservation/cancel/:id`
- **Params:**
  - `id` - reservation ID  
- **Auth:** Required

#### Complete Reservation
- **Method:** `POST`
- **Path:** `/reservation/complete/:id`
- **Params:**
  - `id` – reservation ID  
- **Auth:** Required - roles: `WORKER`, `MANAGER`

#### Get Reservation Details
- **Method:** `GET`
- **Path:** `/reservation/:id`
- **Params:**
  - `id` - reservation ID  
- **Auth:** Required

---

### User

#### Create Worker
- **Method:** `POST`
- **Path:** `/user/`
- **Auth:** Required - role: `MANAGER`

#### Get All Workers
- **Method:** `GET`
- **Path:** `/user/`
- **Auth:** Required - role: `MANAGER`

#### Change Password
- **Method:** `PATCH`
- **Path:** `/user/change-password`
- **Auth:** Required

#### Get Personal Data
- **Method:** `GET`
- **Path:** `/user/personal-data`
- **Auth:** Required

#### Get Own Reservations
- **Method:** `GET`
- **Path:** `/user/reservations`
- **Auth:** Required

#### Delete Worker
- **Method:** `DELETE`
- **Path:** `/user/:id`
- **Params:**
  - `id` - user ID  
- **Auth:** Required - role: `MANAGER`

---

## License

This project is publicly available for viewing and educational purposes only.  
All rights reserved. Do not copy, modify, or distribute without permission.
