package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.Advance4;

public class Advance4Test {

    private final Advance4 x = new Advance4();

    @Test
    void testIsPrime() {
        assertTrue(x.isPrimeNumber(7));
    }

    @Test
    void testNotPrime() {
        assertFalse(x.isPrimeNumber(6));
    }

    @Test
    void testNegative() {
        assertFalse(x.isPrimeNumber(-3));
    }
}
