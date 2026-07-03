package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.LoginService;

public class LoginServiceTest {

    @Test
    void testLoginSuccess() {
        assertTrue(LoginService.login("user", "password"));
    }

    @Test
    void testInvalidUsername() {
        assertFalse(LoginService.login("invalidUser", "password"));
    }

    @Test
    void testInvalidPassword() {
        assertFalse(LoginService.login("user", "wrongPassword"));
    }

    @Test
    void testBothInvalid() {
        assertFalse(LoginService.login("guest", "123456"));
    }

    @Test
    void testBothEmpty() {
        assertFalse(LoginService.login("", ""));
    }

    @Test
    void testEmptyUsername() {
        assertFalse(LoginService.login("", "password"));
    }

    @Test
    void testEmptyPassword() {
        assertFalse(LoginService.login("user", ""));
    }

    @Test
    void testWithSpaces() {
        assertFalse(LoginService.login(" user ", " password "));
    }
}
