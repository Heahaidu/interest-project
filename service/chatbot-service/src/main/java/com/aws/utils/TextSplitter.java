package com.aws.utils;

import java.util.ArrayList;
import java.util.List;

public class TextSplitter {

//      text       văn bản gốc
//      chunkSize  số ký tự mỗi chunk
//      overlap    số ký tự overlap giữa các chunk

    public static List<String> split(String text, int chunkSize, int overlap) {
        List<String> chunks = new ArrayList<>();

        if (text == null || text.isBlank()) {
            return chunks;
        }

        int start = 0;
        int length = text.length();

        while (start < length) {
            int end = Math.min(start + chunkSize, length);
            chunks.add(text.substring(start, end));
            start += (chunkSize - overlap);
        }

        return chunks;
    }
}
