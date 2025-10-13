# Contributing

Thank you for considering contributing to this project! We welcome contributions from the community to help improve and enhance the functionality of our Cloudflare Worker email sieve.

## Project architecture

This project uses the _Functional Core / Imperative Shell_ architecture pattern. The core logic of the email sieve is implemented in pure functions inside the `core` directory, while the `shell` directory handles side effects such as interacting with Cloudflare's APIs.

If you wish to contribute, please try to keep the core logic pure and free of side effects. This will help maintain the testability and reliability of the core functions.
