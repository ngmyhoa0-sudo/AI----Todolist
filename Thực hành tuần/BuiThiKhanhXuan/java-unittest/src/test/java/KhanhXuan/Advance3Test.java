package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.Advance3;

public class Advance3Test {

    private final Advance3 x = new Advance3();

    @Test
    void testFibonacci() {
        assertEquals(8, x.fibonacci(6));
    }

    @Test
    void testFibonacciNegative() {
        assertEquals(-1, x.fibonacci(-1));
    }

    @Test
    void testFibonacciZero() {
        assertEquals(0, x.fibonacci(0));
    }
}
