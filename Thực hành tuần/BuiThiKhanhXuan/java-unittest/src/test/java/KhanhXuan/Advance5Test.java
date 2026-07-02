package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.Advance5;

public class Advance5Test {

    private final Advance5 x = new Advance5();

    @Test
    void testNotSymmetric() {
        assertFalse(x.kiemTraDoiXung(112));
    }

    @Test
    void testSymmetric() {
        assertTrue(x.kiemTraDoiXung(12121));
    }

    @Test
    void testZero() {
        assertTrue(x.kiemTraDoiXung(0));
    }

    @Test
    void testNegativeNotSymmetric() {
        assertFalse(x.kiemTraDoiXung(-102));
    }

    @Test
    void testNegativeSymmetric() {
        assertTrue(x.kiemTraDoiXung(-101));
    }
}
