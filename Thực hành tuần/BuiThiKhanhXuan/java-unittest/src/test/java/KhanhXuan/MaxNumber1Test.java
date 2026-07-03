package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.MaxNumber1;

public class MaxNumber1Test {

    private final MaxNumber1 maxNumber1 = new MaxNumber1();

    @Test
    void testFirstNumberIsMax() {
        maxNumber1.setNumber1(10);
        maxNumber1.setNumber2(5);
        maxNumber1.setNumber3(3);
        assertEquals(10, maxNumber1.max3());
    }

    @Test
    void testSecondNumberIsMax() {
        maxNumber1.setNumber1(5);
        maxNumber1.setNumber2(10);
        maxNumber1.setNumber3(3);
        assertEquals(10, maxNumber1.max3());
    }

    @Test
    void testThirdNumberIsMax() {
        maxNumber1.setNumber1(5);
        maxNumber1.setNumber2(3);
        maxNumber1.setNumber3(10);
        assertEquals(10, maxNumber1.max3());
    }

    @Test
    void testAllEqual() {
        maxNumber1.setNumber1(7);
        maxNumber1.setNumber2(7);
        maxNumber1.setNumber3(7);
        assertEquals(7, maxNumber1.max3());
    }

    @Test
    void testTwoEqual() {
        maxNumber1.setNumber1(10);
        maxNumber1.setNumber2(10);
        maxNumber1.setNumber3(5);
        assertEquals(10, maxNumber1.max3());
    }
}
