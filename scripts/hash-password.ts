import { hash } from 'bcrypt'
;(async () => {
  const password = 'aaa123'
  const hashPassword = await hash(password, 10)
  console.log(hashPassword)
})()
