package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.ArraySum;

public class ArraySumTest {

    private final ArraySum x = new ArraySum();

    @Test
    void testPositiveNumbers() {
        int[] sum1 = {1, 2, 3, 4, 5};
        assertEquals(15, x.calculateSum(sum1));
    }

    @Test
    void testMixedNumbers() {
        int[] sum2 = {-1, 0, 1};
        assertEquals(0, x.calculateSum(sum2));
    }

    @Test
    void testLargeNumbers() {
        int[] sum3 = {10, 20, 30, 40, 50};
        assertEquals(150, x.calculateSum(sum3));
    }
}
