package KhanhXuan;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import Xuan.StringReversal;

public class StringReversalTest {

    private final StringReversal x = new StringReversal();

    @Test
    void testNormalString() {
        assertEquals("olleh", x.reverseString("hello"));
    }

    @Test
    void testAnotherString() {
        assertEquals("dlrow", x.reverseString("world"));
    }

    @Test
    void testEmptyString() {
        assertEquals("", x.reverseString(""));
    }

    @Test
    void testSingleChar() {
        assertEquals("a", x.reverseString("a"));
    }

    @Test
    void testWithSpace() {
        assertEquals("dlrow olleh", x.reverseString("hello world"));
    }
}
