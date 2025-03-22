class UserService{
    public async createUser(user: User): Promise<User> {
        // create user
    }
    public async getUserById(userId: string): Promise<User> {
        // get user by id
    }
    public async updateUser(userId: string, user: User): Promise<User> {
        // update user
    }
    public async deleteUser(userId: string): Promise<void> {
        // delete user
    }
    public async getUsers(): Promise<User[]> {
        // get all users
    }
    public async getUserByEmail(email: string): Promise<User> {
        // get user by email
    }
}