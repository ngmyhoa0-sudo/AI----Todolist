package Xuan;

public class LoginService {

    public static final String USERNAME = "user";
    public static final String PASSWORD = "password";

    public static boolean login(String username, String password) {
        return username.equals(USERNAME) && password.equals(PASSWORD);
    }
}
