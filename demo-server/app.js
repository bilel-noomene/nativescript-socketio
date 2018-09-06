'use strict'
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const nspChat = io.of('/chat')
const nspDefault = io.nsps[ '/' ];

let messageList = []
let userList = []

io.on('connection', function (socket) {
	console.log('User Connected');
	socket.emit('connected', 'Welcome');
	let addedUser = false;

	console.log('connection query params', socket.handshake.query);
	socket.on('add user', function (data, cb) {
		if (addedUser) return;
		addedUser = true;
		socket.username = data.username;
		console.log('Username: ', data.username);
		userList.push({ username: data.username });
		socket.emit('login', { userList: userList });
		socket.broadcast.emit('user joined', {
			username: data.username
		});
		cb(true);
		console.log('add user ack');
	})

	socket.on('new message', function (data, cb) {
		cb(true)
		console.log(data)
		messageList.push(data)
		socket.broadcast.emit('new message', data)
	})

	socket.on('getUsers', function () {
		socket.emit('getUsers', userList)
	})
	socket.on('user count', function () {
		socket.emit('user count', userList.length)
	})
	socket.on('getMessages', function () {
		socket.emit('getMessages', messageList)
	})

	socket.on('disconnect', function () {
		console.log('User Disconnected')
		if (addedUser) {
			for (let i = 0; i < userList.length; i++) {
				if (socket.username === userList[ i ].username) {
					userList.splice(i, 1)
				}
			}
			socket.broadcast.emit('user left', {
				username: socket.username
			})
		}
	})
})

nspDefault.on('connect', (socket) => {
	console.log('Joined Namespace: /')

	socket.on('disconnect', () => {
		console.log('Left Namespace: /')
	})
})

nspChat.on('connect', (socket) => {
	console.log('Joined Namespace: /chat')

    nspChat.emit('test boolean', {trueValue: true, falseValue: false})

	socket.on('disconnect', () => {
		console.log('Left Namespace: /chat')
	})
})

server.listen(3001)
