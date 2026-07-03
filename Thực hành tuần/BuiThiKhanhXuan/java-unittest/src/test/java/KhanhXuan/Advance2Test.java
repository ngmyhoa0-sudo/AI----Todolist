package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.Advance2;

public class Advance2Test {

    private final Advance2 x = new Advance2();

    @Test
    void testSum() {
        assertEquals(23, x.sum(5765));
    }

    @Test
    void testSumNegative() {
        assertEquals(23, x.sum(-5765));
    }

    @Test
    void testSumZero() {
        assertEquals(0, x.sum(0));
    }
}
