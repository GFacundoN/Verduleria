package com.verduleria.app_verduleria.specifications;

import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GenericSpecification<T> implements Specification<T> {

    private final String search;

    public GenericSpecification(String search) {
        this.search = search;
    }

    @Override
    public Predicate toPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder builder) {
        if (search == null || search.isEmpty()) {
            return builder.conjunction();
        }

        Pattern pattern = Pattern.compile("(\\w+?)(:|<|>)(\\w+?),");
        Matcher matcher = pattern.matcher(search + ",");
        List<Predicate> predicates = new ArrayList<>();

        while (matcher.find()) {
            String key = matcher.group(1);
            String operation = matcher.group(2);
            String value = matcher.group(3);

            if (operation.equalsIgnoreCase(">")) {
                predicates.add(builder.greaterThanOrEqualTo(root.get(key), value));
            } else if (operation.equalsIgnoreCase("<")) {
                predicates.add(builder.lessThanOrEqualTo(root.get(key), value));
            } else if (operation.equalsIgnoreCase(":")) {
                if (root.get(key).getJavaType() == String.class) {
                    predicates.add(builder.like(builder.lower(root.get(key)), "%" + value.toLowerCase() + "%"));
                } else {
                    predicates.add(builder.equal(root.get(key), value));
                }
            }
        }
        return builder.and(predicates.toArray(new Predicate[0]));
    }
}