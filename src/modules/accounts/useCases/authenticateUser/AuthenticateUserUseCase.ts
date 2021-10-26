import { compare } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import { inject, injectable } from 'tsyringe'

import { AppError } from '../../../../errors/AppError'
import { IUserRepository } from '../../repositories/interface/IUserRepository'

interface IRequest {
    email: string
    password: string
}

interface IResponse {
    user: {
        name: string
        email: string
    }
    token: string
}

@injectable()
class AuthenticateUserUseCase {
    constructor(
        @inject('UserRepository')
        private userRepository: IUserRepository
    ) {}

    async execute({ email, password }: IRequest): Promise<IResponse> {
        if (!email || !password)
            throw new AppError('Email or password not provided!')

        const user = await this.userRepository.findByEmail(email)

        if (!user) throw new AppError('Email or password incorrect!')

        const passwordMatch = await compare(password, user.password)

        if (!passwordMatch) throw new AppError('Email or password incorrect!')

        const token = sign({}, '8eabb14b927a8f90b3060ad10e972dac', {
            subject: user.id,
            expiresIn: '1d'
        })

        const tokenReturn: IResponse = {
            token,
            user: {
                name: user.name,
                email: user.email
            }
        }

        return tokenReturn
    }
}

export { AuthenticateUserUseCase }