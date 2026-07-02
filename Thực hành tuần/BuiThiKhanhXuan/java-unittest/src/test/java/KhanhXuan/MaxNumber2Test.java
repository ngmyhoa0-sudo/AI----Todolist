package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.MaxNumber2;

public class MaxNumber2Test {

    @Test
    void testFirstNumberIsGreater() {
        MaxNumber2 maxNumber2 = new MaxNumber2(10, 5);
        assertEquals(10, maxNumber2.max2());
    }

    @Test
    void testSecondNumberIsGreater() {
        MaxNumber2 maxNumber2 = new MaxNumber2(5, 10);
        assertEquals(10, maxNumber2.max2());
    }

    @Test
    void testEqualNumbers() {
        MaxNumber2 maxNumber2 = new MaxNumber2(7, 7);
        assertEquals(7, maxNumber2.max2());
    }
}
